"""
Graph RAG Retriever - Knowledge graph based retrieval
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from .knowledge_graph import (
    KnowledgeGraph,
    Node,
    Edge,
    NodeType,
    EdgeType,
    GraphEntity
)
from ..base import BaseLLM, Message


@dataclass
class GraphRetrievalResult:
    """Result from Graph RAG retrieval"""
    nodes: List[Node]
    edges: List[Edge]
    query: str
    context: str  # Combined context from graph
    entities: List[GraphEntity]


class GraphRAGRetriever:
    """Graph RAG Retriever using knowledge graph for context retrieval"""

    def __init__(
        self,
        knowledge_graph: KnowledgeGraph,
        llm: Optional[BaseLLM] = None,
        max_depth: int = 2,
        max_nodes: int = 10
    ):
        self.knowledge_graph = knowledge_graph
        self.llm = llm
        self.max_depth = max_depth
        self.max_nodes = max_nodes

    async def extract_entities(self, query: str) -> List[GraphEntity]:
        """Extract entities from query using LLM"""
        if not self.llm:
            # Simple keyword extraction fallback
            return self._simple_entity_extraction(query)

        system_prompt = """당신은 부동산 경매 도메인의 엔티티 추출 전문가입니다.
주어진 질문에서 중요한 엔티티(개체)를 추출하세요.

엔티티 유형:
- property: 부동산 물건 (아파트, 빌라, 토지 등)
- registry: 등기부등본 관련
- owner: 소유자
- right: 권리 (저당권, 전세권, 근저당권 등)
- restriction: 제한사항 (압류, 가압류, 가처분 등)
- court: 법원
- auction: 경매 정보
- location: 위치 정보 (지역, 주소)
- concept: 법률/경매 개념 및 용어

JSON 형식으로 응답하세요:
[
    {"name": "엔티티명", "type": "엔티티유형", "properties": {}}
]"""

        messages = [
            Message(role="system", content=system_prompt),
            Message(role="user", content=f"다음 질문에서 엔티티를 추출하세요:\n\n{query}")
        ]

        try:
            response = await self.llm.generate(messages, temperature=0.1)
            import json
            entities_data = json.loads(response.content)

            entities = []
            for e in entities_data:
                try:
                    node_type = NodeType(e.get("type", "concept"))
                except ValueError:
                    node_type = NodeType.CONCEPT

                entities.append(GraphEntity(
                    name=e.get("name", ""),
                    type=node_type,
                    properties=e.get("properties", {})
                ))

            return entities

        except Exception:
            return self._simple_entity_extraction(query)

    def _simple_entity_extraction(self, query: str) -> List[GraphEntity]:
        """Simple keyword-based entity extraction"""
        # Domain-specific keywords
        keyword_mapping = {
            # Rights
            "저당권": NodeType.RIGHT,
            "근저당권": NodeType.RIGHT,
            "전세권": NodeType.RIGHT,
            "지상권": NodeType.RIGHT,
            "임차권": NodeType.RIGHT,

            # Restrictions
            "압류": NodeType.RESTRICTION,
            "가압류": NodeType.RESTRICTION,
            "가처분": NodeType.RESTRICTION,
            "경매개시": NodeType.RESTRICTION,

            # Property types
            "아파트": NodeType.PROPERTY,
            "빌라": NodeType.PROPERTY,
            "오피스텔": NodeType.PROPERTY,
            "토지": NodeType.PROPERTY,
            "상가": NodeType.PROPERTY,
            "주택": NodeType.PROPERTY,

            # Registry
            "등기부등본": NodeType.REGISTRY,
            "등기부": NodeType.REGISTRY,
            "갑구": NodeType.REGISTRY,
            "을구": NodeType.REGISTRY,
            "표제부": NodeType.REGISTRY,

            # Auction
            "경매": NodeType.AUCTION,
            "입찰": NodeType.AUCTION,
            "낙찰": NodeType.AUCTION,
            "유찰": NodeType.AUCTION,
            "매각": NodeType.AUCTION,

            # Concepts
            "말소기준권리": NodeType.CONCEPT,
            "배당": NodeType.CONCEPT,
            "대항력": NodeType.CONCEPT,
            "우선변제권": NodeType.CONCEPT,
            "인수": NodeType.CONCEPT,
            "소멸": NodeType.CONCEPT,
        }

        entities = []
        for keyword, node_type in keyword_mapping.items():
            if keyword in query:
                entities.append(GraphEntity(
                    name=keyword,
                    type=node_type,
                    properties={}
                ))

        return entities

    async def retrieve(
        self,
        query: str,
        max_depth: Optional[int] = None,
        max_nodes: Optional[int] = None,
        node_types: Optional[List[NodeType]] = None
    ) -> GraphRetrievalResult:
        """Retrieve relevant context from knowledge graph"""
        depth = max_depth or self.max_depth
        limit = max_nodes or self.max_nodes

        # Extract entities from query
        entities = await self.extract_entities(query)

        # Search for matching nodes
        all_nodes: Dict[str, Node] = {}
        all_edges: Dict[str, Edge] = {}

        # Search by entity names
        for entity in entities:
            search_types = [entity.type] if not node_types else node_types
            found_nodes = await self.knowledge_graph.search_nodes(
                query=entity.name,
                node_types=search_types,
                limit=limit // max(len(entities), 1)
            )

            for node in found_nodes:
                all_nodes[node.id] = node

        # If no nodes found, do general search
        if not all_nodes:
            found_nodes = await self.knowledge_graph.search_nodes(
                query=query,
                node_types=node_types,
                limit=limit
            )
            for node in found_nodes:
                all_nodes[node.id] = node

        # Get subgraph with neighbors
        if all_nodes:
            node_ids = list(all_nodes.keys())[:limit]
            subgraph_nodes, subgraph_edges = await self.knowledge_graph.get_subgraph(
                node_ids=node_ids,
                depth=depth
            )

            for node in subgraph_nodes:
                all_nodes[node.id] = node
            for edge in subgraph_edges:
                all_edges[edge.id] = edge

        # Build context from graph
        nodes_list = list(all_nodes.values())[:limit]
        edges_list = list(all_edges.values())
        context = self._build_graph_context(nodes_list, edges_list)

        return GraphRetrievalResult(
            nodes=nodes_list,
            edges=edges_list,
            query=query,
            context=context,
            entities=entities
        )

    def _build_graph_context(
        self,
        nodes: List[Node],
        edges: List[Edge]
    ) -> str:
        """Build context string from graph nodes and edges"""
        if not nodes:
            return ""

        context_parts = []

        # Group nodes by type
        nodes_by_type: Dict[NodeType, List[Node]] = {}
        for node in nodes:
            if node.type not in nodes_by_type:
                nodes_by_type[node.type] = []
            nodes_by_type[node.type].append(node)

        # Build context for each type
        type_labels = {
            NodeType.PROPERTY: "부동산 물건",
            NodeType.REGISTRY: "등기부등본",
            NodeType.OWNER: "소유자",
            NodeType.RIGHT: "권리사항",
            NodeType.RESTRICTION: "제한사항",
            NodeType.COURT: "법원",
            NodeType.AUCTION: "경매정보",
            NodeType.LOCATION: "위치",
            NodeType.DOCUMENT: "문서",
            NodeType.CONCEPT: "관련 개념",
        }

        for node_type, type_nodes in nodes_by_type.items():
            label = type_labels.get(node_type, node_type.value)
            context_parts.append(f"### {label}")

            for node in type_nodes:
                node_info = f"- **{node.name}**"
                if node.content:
                    # Truncate long content
                    content = node.content[:500] + "..." if len(node.content) > 500 else node.content
                    node_info += f": {content}"
                context_parts.append(node_info)

            context_parts.append("")

        # Add relationship context if edges exist
        if edges:
            context_parts.append("### 관계")
            edge_labels = {
                EdgeType.HAS_REGISTRY: "등기부등본 보유",
                EdgeType.OWNED_BY: "소유",
                EdgeType.HAS_RIGHT: "권리 설정",
                EdgeType.HAS_RESTRICTION: "제한 설정",
                EdgeType.LOCATED_IN: "위치",
                EdgeType.AUCTIONED_AT: "경매 진행",
                EdgeType.RELATED_TO: "관련",
                EdgeType.DEFINED_AS: "정의",
                EdgeType.REFERS_TO: "참조",
            }

            node_map = {n.id: n for n in nodes}
            for edge in edges[:10]:  # Limit edges in context
                source = node_map.get(edge.source_id)
                target = node_map.get(edge.target_id)
                if source and target:
                    label = edge_labels.get(edge.type, edge.type.value)
                    context_parts.append(f"- {source.name} --[{label}]--> {target.name}")

        return "\n".join(context_parts)

    async def add_entity(
        self,
        entity: GraphEntity,
        content: str = ""
    ) -> str:
        """Add an entity to the knowledge graph"""
        import uuid
        node = Node(
            id=str(uuid.uuid4()),
            type=entity.type,
            name=entity.name,
            properties=entity.properties,
            content=content
        )
        return await self.knowledge_graph.add_node(node)

    async def add_relation(
        self,
        source_id: str,
        target_id: str,
        relation_type: EdgeType,
        properties: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add a relation between entities in the knowledge graph"""
        import uuid
        edge = Edge(
            id=str(uuid.uuid4()),
            type=relation_type,
            source_id=source_id,
            target_id=target_id,
            properties=properties or {}
        )
        return await self.knowledge_graph.add_edge(edge)
