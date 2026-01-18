"""
Base LLM Interface and Factory
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass
from enum import Enum


class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


@dataclass
class Message:
    role: str  # "system", "user", "assistant"
    content: str


@dataclass
class LLMResponse:
    content: str
    usage: Optional[Dict[str, int]] = None
    model: Optional[str] = None


class BaseLLM(ABC):
    """Base class for LLM providers"""

    @abstractmethod
    async def generate(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> LLMResponse:
        """Generate a response from the LLM"""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response from the LLM"""
        pass


class OpenAILLM(BaseLLM):
    """OpenAI LLM implementation"""

    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model
        self._client = None

    @property
    def client(self):
        if self._client is None:
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(api_key=self.api_key)
        return self._client

    async def generate(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> LLMResponse:
        formatted_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=formatted_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs
        )

        return LLMResponse(
            content=response.choices[0].message.content,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
            model=response.model,
        )

    async def generate_stream(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        formatted_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=formatted_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
            **kwargs
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


class AnthropicLLM(BaseLLM):
    """Anthropic LLM implementation"""

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key
        self.model = model
        self._client = None

    @property
    def client(self):
        if self._client is None:
            from anthropic import AsyncAnthropic
            self._client = AsyncAnthropic(api_key=self.api_key)
        return self._client

    async def generate(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> LLMResponse:
        # Extract system message if present
        system_content = ""
        formatted_messages = []

        for msg in messages:
            if msg.role == "system":
                system_content = msg.content
            else:
                formatted_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system_content if system_content else None,
            messages=formatted_messages,
            temperature=temperature,
            **kwargs
        )

        return LLMResponse(
            content=response.content[0].text,
            usage={
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
            model=response.model,
        )

    async def generate_stream(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        # Extract system message if present
        system_content = ""
        formatted_messages = []

        for msg in messages:
            if msg.role == "system":
                system_content = msg.content
            else:
                formatted_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        async with self.client.messages.stream(
            model=self.model,
            max_tokens=max_tokens,
            system=system_content if system_content else None,
            messages=formatted_messages,
            temperature=temperature,
            **kwargs
        ) as stream:
            async for text in stream.text_stream:
                yield text


class LLMFactory:
    """Factory for creating LLM instances"""

    @staticmethod
    def create(
        provider: str,
        api_key: str,
        model: Optional[str] = None
    ) -> BaseLLM:
        if provider == LLMProvider.OPENAI:
            return OpenAILLM(
                api_key=api_key,
                model=model or "gpt-4o"
            )
        elif provider == LLMProvider.ANTHROPIC:
            return AnthropicLLM(
                api_key=api_key,
                model=model or "claude-3-5-sonnet-20241022"
            )
        else:
            raise ValueError(f"Unknown LLM provider: {provider}")
