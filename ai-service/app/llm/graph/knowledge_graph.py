"""
Knowledge Graph for Graph RAG
"""
from typing import List, Dict, Any, Optional, Set
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod


class NodeType(str, Enum):
    """Types of nodes in the knowledge graph"""
    PROPERTY = "property"  # 부동산 물건
    REGISTRY = "registry"  # 등기부등본
    OWNER = "owner"  # 소유자
    RIGHT = "right"  # 권리 (저당권, 전세권 등)
    RESTRICTION = "restriction"  # 제한사항
    COURT = "court"  # 법원
    AUCTION = "auction"  # 경매 정보
    LOCATION = "location"  # 위치 정보
    DOCUMENT = "document"  # 문서
    CONCEPT = "concept"  # 개념/용어


class EdgeType(str, Enum):
    """Types of edges in the knowledge graph"""
    HAS_REGISTRY = "has_registry"  # 부동산 -> 등기부등본
    OWNED_BY = "owned_by"  # 부동산 -> 소유자
    HAS_RIGHT = "has_right"  # 등기부등본 -> 권리
    HAS_RESTRICTION = "has_restriction"  # 등기부등본 -> 제한사항
    LOCATED_IN = "located_in"  # 부동산 -> 위치
    AUCTIONED_AT = "auctioned_at"  # 부동산 -> 법원
    RELATED_TO = "related_to"  # 일반적인 관계
    DEFINED_AS = "defined_as"  # 용어 정의
    REFERS_TO = "refers_to"  # 참조 관계


@dataclass
class Node:
    """Node in the knowledge graph"""
    id: str
    type: NodeType
    name: str
    properties: Dict[str, Any] = field(default_factory=dict)
    content: str = ""  # Full text content if available


@dataclass
class Edge:
    """Edge in the knowledge graph"""
    id: str
    type: EdgeType
    source_id: str
    target_id: str
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphEntity:
    """Entity extracted from text for graph construction"""
    name: str
    type: NodeType
    properties: Dict[str, Any] = field(default_factory=dict)
    relations: List[Dict[str, Any]] = field(default_factory=list)


class KnowledgeGraph(ABC):
    """Abstract base class for knowledge graph implementations"""

    @abstractmethod
    async def add_node(self, node: Node) -> str:
        """Add a node to the graph"""
        pass

    @abstractmethod
    async def add_edge(self, edge: Edge) -> str:
        """Add an edge to the graph"""
        pass

    @abstractmethod
    async def get_node(self, node_id: str) -> Optional[Node]:
        """Get a node by ID"""
        pass

    @abstractmethod
    async def get_neighbors(
        self,
        node_id: str,
        depth: int = 1,
        edge_types: Optional[List[EdgeType]] = None
    ) -> List[Node]:
        """Get neighboring nodes up to specified depth"""
        pass

    @abstractmethod
    async def search_nodes(
        self,
        query: str,
        node_types: Optional[List[NodeType]] = None,
        limit: int = 10
    ) -> List[Node]:
        """Search nodes by text query"""
        pass

    @abstractmethod
    async def get_subgraph(
        self,
        node_ids: List[str],
        depth: int = 1
    ) -> tuple[List[Node], List[Edge]]:
        """Get subgraph containing specified nodes and their neighbors"""
        pass


class Neo4jKnowledgeGraph(KnowledgeGraph):
    """Neo4j-based knowledge graph implementation"""

    def __init__(self, uri: str, user: str, password: str):
        self.uri = uri
        self.user = user
        self.password = password
        self._driver = None

    @property
    def driver(self):
        if self._driver is None:
            from neo4j import AsyncGraphDatabase
            self._driver = AsyncGraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password)
            )
        return self._driver

    async def close(self):
        if self._driver:
            await self._driver.close()

    async def add_node(self, node: Node) -> str:
        query = """
        MERGE (n:Node {id: $id})
        SET n.type = $type,
            n.name = $name,
            n.content = $content,
            n += $properties
        RETURN n.id as id
        """
        async with self.driver.session() as session:
            result = await session.run(
                query,
                id=node.id,
                type=node.type.value,
                name=node.name,
                content=node.content,
                properties=node.properties
            )
            record = await result.single()
            return record["id"] if record else node.id

    async def add_edge(self, edge: Edge) -> str:
        query = """
        MATCH (a:Node {id: $source_id})
        MATCH (b:Node {id: $target_id})
        MERGE (a)-[r:RELATES {id: $id, type: $type}]->(b)
        SET r += $properties
        RETURN r.id as id
        """
        async with self.driver.session() as session:
            result = await session.run(
                query,
                id=edge.id,
                type=edge.type.value,
                source_id=edge.source_id,
                target_id=edge.target_id,
                properties=edge.properties
            )
            record = await result.single()
            return record["id"] if record else edge.id

    async def get_node(self, node_id: str) -> Optional[Node]:
        query = """
        MATCH (n:Node {id: $id})
        RETURN n
        """
        async with self.driver.session() as session:
            result = await session.run(query, id=node_id)
            record = await result.single()
            if record:
                n = record["n"]
                return Node(
                    id=n["id"],
                    type=NodeType(n.get("type", "document")),
                    name=n.get("name", ""),
                    content=n.get("content", ""),
                    properties={k: v for k, v in n.items() if k not in ["id", "type", "name", "content"]}
                )
            return None

    async def get_neighbors(
        self,
        node_id: str,
        depth: int = 1,
        edge_types: Optional[List[EdgeType]] = None
    ) -> List[Node]:
        if edge_types:
            edge_filter = f"WHERE type(r) IN {[e.value for e in edge_types]}"
        else:
            edge_filter = ""

        query = f"""
        MATCH (start:Node {{id: $id}})-[r*1..{depth}]-(neighbor:Node)
        {edge_filter}
        RETURN DISTINCT neighbor
        """
        async with self.driver.session() as session:
            result = await session.run(query, id=node_id)
            nodes = []
            async for record in result:
                n = record["neighbor"]
                nodes.append(Node(
                    id=n["id"],
                    type=NodeType(n.get("type", "document")),
                    name=n.get("name", ""),
                    content=n.get("content", ""),
                    properties={k: v for k, v in n.items() if k not in ["id", "type", "name", "content"]}
                ))
            return nodes

    async def search_nodes(
        self,
        query: str,
        node_types: Optional[List[NodeType]] = None,
        limit: int = 10
    ) -> List[Node]:
        type_filter = ""
        if node_types:
            types = [t.value for t in node_types]
            type_filter = f"AND n.type IN {types}"

        cypher = f"""
        MATCH (n:Node)
        WHERE (n.name CONTAINS $query OR n.content CONTAINS $query)
        {type_filter}
        RETURN n
        LIMIT $limit
        """
        async with self.driver.session() as session:
            result = await session.run(cypher, query=query, limit=limit)
            nodes = []
            async for record in result:
                n = record["n"]
                nodes.append(Node(
                    id=n["id"],
                    type=NodeType(n.get("type", "document")),
                    name=n.get("name", ""),
                    content=n.get("content", ""),
                    properties={k: v for k, v in n.items() if k not in ["id", "type", "name", "content"]}
                ))
            return nodes

    async def get_subgraph(
        self,
        node_ids: List[str],
        depth: int = 1
    ) -> tuple[List[Node], List[Edge]]:
        query = f"""
        MATCH (n:Node)
        WHERE n.id IN $ids
        OPTIONAL MATCH path = (n)-[r*1..{depth}]-(m:Node)
        RETURN DISTINCT n, collect(DISTINCT m) as neighbors, collect(DISTINCT r) as edges
        """
        async with self.driver.session() as session:
            result = await session.run(query, ids=node_ids)

            all_nodes: Dict[str, Node] = {}
            all_edges: List[Edge] = []

            async for record in result:
                n = record["n"]
                node = Node(
                    id=n["id"],
                    type=NodeType(n.get("type", "document")),
                    name=n.get("name", ""),
                    content=n.get("content", ""),
                    properties={k: v for k, v in n.items() if k not in ["id", "type", "name", "content"]}
                )
                all_nodes[node.id] = node

                for neighbor in record["neighbors"]:
                    if neighbor:
                        neighbor_node = Node(
                            id=neighbor["id"],
                            type=NodeType(neighbor.get("type", "document")),
                            name=neighbor.get("name", ""),
                            content=neighbor.get("content", ""),
                            properties={k: v for k, v in neighbor.items() if k not in ["id", "type", "name", "content"]}
                        )
                        all_nodes[neighbor_node.id] = neighbor_node

            return list(all_nodes.values()), all_edges


class InMemoryKnowledgeGraph(KnowledgeGraph):
    """In-memory knowledge graph for testing and small datasets"""

    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, Edge] = {}
        self.adjacency: Dict[str, Set[str]] = {}  # node_id -> set of edge_ids

    async def add_node(self, node: Node) -> str:
        self.nodes[node.id] = node
        if node.id not in self.adjacency:
            self.adjacency[node.id] = set()
        return node.id

    async def add_edge(self, edge: Edge) -> str:
        self.edges[edge.id] = edge

        if edge.source_id not in self.adjacency:
            self.adjacency[edge.source_id] = set()
        if edge.target_id not in self.adjacency:
            self.adjacency[edge.target_id] = set()

        self.adjacency[edge.source_id].add(edge.id)
        self.adjacency[edge.target_id].add(edge.id)

        return edge.id

    async def get_node(self, node_id: str) -> Optional[Node]:
        return self.nodes.get(node_id)

    async def get_neighbors(
        self,
        node_id: str,
        depth: int = 1,
        edge_types: Optional[List[EdgeType]] = None
    ) -> List[Node]:
        visited: Set[str] = {node_id}
        current_level = {node_id}
        result = []

        for _ in range(depth):
            next_level: Set[str] = set()

            for nid in current_level:
                edge_ids = self.adjacency.get(nid, set())

                for edge_id in edge_ids:
                    edge = self.edges.get(edge_id)
                    if not edge:
                        continue

                    if edge_types and edge.type not in edge_types:
                        continue

                    neighbor_id = edge.target_id if edge.source_id == nid else edge.source_id

                    if neighbor_id not in visited:
                        visited.add(neighbor_id)
                        next_level.add(neighbor_id)

                        node = self.nodes.get(neighbor_id)
                        if node:
                            result.append(node)

            current_level = next_level

        return result

    async def search_nodes(
        self,
        query: str,
        node_types: Optional[List[NodeType]] = None,
        limit: int = 10
    ) -> List[Node]:
        query_lower = query.lower()
        results = []

        for node in self.nodes.values():
            if node_types and node.type not in node_types:
                continue

            if query_lower in node.name.lower() or query_lower in node.content.lower():
                results.append(node)

                if len(results) >= limit:
                    break

        return results

    async def get_subgraph(
        self,
        node_ids: List[str],
        depth: int = 1
    ) -> tuple[List[Node], List[Edge]]:
        all_nodes: Dict[str, Node] = {}
        all_edges: Dict[str, Edge] = {}

        for node_id in node_ids:
            node = self.nodes.get(node_id)
            if node:
                all_nodes[node_id] = node

            neighbors = await self.get_neighbors(node_id, depth)
            for neighbor in neighbors:
                all_nodes[neighbor.id] = neighbor

        # Collect edges between all collected nodes
        for edge in self.edges.values():
            if edge.source_id in all_nodes and edge.target_id in all_nodes:
                all_edges[edge.id] = edge

        return list(all_nodes.values()), list(all_edges.values())
