# naver_land_api.py
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Tuple
import time
import requests


NAVER_LAND_BASE = "https://new.land.naver.com"


@dataclass
class ArticleQuery:
    complex_no: int
    page: int = 1

    # 필터들 (필요한 것만 바꿔서 쓰면 됨)
    real_estate_type: str = "APT:ABYG:JGC:PRE"
    trade_type: str = "A1"  # A1=매매, B1=전세, B2=월세 등 (화면 요청값 기준)
    tag: str = "::::::::"
    rent_price_min: int = 0
    rent_price_max: int = 900_000_000
    price_min: int = 0
    price_max: int = 900_000_000
    area_min: int = 0
    area_max: int = 900_000_000
    min_household_count: Optional[int] = None
    max_household_count: Optional[int] = None
    show_article: bool = False
    same_address_group: bool = True
    price_type: str = "RETAIL"
    directions: str = ""
    building_nos: str = ""
    area_nos: str = ""
    type: str = "list"
    order: str = "prc"  # prc=가격순, date=최신순

    def to_params(self) -> Dict[str, Any]:
        params = {
            "realEstateType": self.real_estate_type,
            "tradeType": self.trade_type,
            "tag": self.tag,
            "rentPriceMin": self.rent_price_min,
            "rentPriceMax": self.rent_price_max,
            "priceMin": self.price_min,
            "priceMax": self.price_max,
            "areaMin": self.area_min,
            "areaMax": self.area_max,
            "oldBuildYears": "",
            "recentlyBuildYears": "",
            "minHouseHoldCount": "" if self.min_household_count is None else self.min_household_count,
            "maxHouseHoldCount": "" if self.max_household_count is None else self.max_household_count,
            "showArticle": "true" if self.show_article else "false",
            "sameAddressGroup": "true" if self.same_address_group else "false",
            "minMaintenanceCost": "",
            "maxMaintenanceCost": "",
            "priceType": self.price_type,
            "directions": self.directions,
            "page": self.page,
            "complexNo": self.complex_no,
            "buildingNos": self.building_nos,
            "areaNos": self.area_nos,
            "type": self.type,
            "order": self.order,
        }
        return params


class NaverLandClient:
    """
    new.land.naver.com 내부 API 래퍼.
    - headers에 Authorization(Bearer ...) 필수인 경우가 많음.
    - 쿠키가 필요한 경우 cookies도 같이 넣어야 함.
    """

    def __init__(
        self,
        *,
        authorization_bearer: str,
        cookies: Optional[Dict[str, str]] = None,
        user_agent: Optional[str] = None,
        referer: Optional[str] = None,
        timeout: int = 15,
    ) -> None:
        if not authorization_bearer.strip().lower().startswith("bearer "):
            authorization_bearer = f"Bearer {authorization_bearer.strip()}"

        self.session = requests.Session()
        self.timeout = timeout

        headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "authorization": authorization_bearer,
            "user-agent": user_agent
            or "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "referer": referer or "https://new.land.naver.com/",
        }
        self.session.headers.update(headers)

        if cookies:
            self.session.cookies.update(cookies)

    def _get_json(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{NAVER_LAND_BASE}{path}"
        r = self.session.get(url, params=params, timeout=self.timeout)
        if r.status_code != 200:
            raise RuntimeError(f"HTTP {r.status_code} for {url} :: {r.text[:300]}")
        try:
            return r.json()
        except ValueError as e:
            raise RuntimeError(f"Non-JSON response for {url} :: {r.text[:300]}") from e

    def articles_by_complex(self, query: ArticleQuery) -> Dict[str, Any]:
        """
        단지 기준 매물 리스트 조회
        반환 JSON 안의 articleList가 핵심.
        """
        path = f"/api/articles/complex/{query.complex_no}"
        return self._get_json(path, params=query.to_params())

    def articles_by_complex_all(
        self,
        *,
        complex_no: int,
        start_page: int = 1,
        end_page: int = 10,
        sleep_sec: float = 0.8,
        base_query: Optional[ArticleQuery] = None,
        stop_when_empty: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        여러 페이지를 돌며 articleList를 누적해서 반환
        """
        all_articles: List[Dict[str, Any]] = []
        base_query = base_query or ArticleQuery(complex_no=complex_no)

        for page in range(start_page, end_page + 1):
            q = ArticleQuery(**asdict(base_query))
            q.page = page
            data = self.articles_by_complex(q)
            articles = data.get("articleList", []) or []
            if not articles and stop_when_empty:
                break
            all_articles.extend(articles)
            time.sleep(sleep_sec)

        return all_articles

    def article_detail(self, article_no: str) -> Dict[str, Any]:
        """
        매물 상세 조회 (articleNo 기반)
        """
        path = f"/api/articles/{article_no}"
        return self._get_json(path)

    def search_complex(self, keyword: str) -> Dict[str, Any]:
        """
        단지 검색 (아파트명, 지역명 등)
        """
        path = "/api/search"
        params = {"keyword": keyword}
        return self._get_json(path, params=params)

    def complex_info(self, complex_no: int) -> Dict[str, Any]:
        """
        단지 상세 정보 조회
        """
        path = f"/api/complexes/{complex_no}"
        return self._get_json(path)

    def articles_by_region(
        self,
        *,
        cortarNo: str,  # 지역코드 (예: 1168000000 = 강남구)
        page: int = 1,
        trade_type: str = "A1",
        real_estate_type: str = "APT",
    ) -> Dict[str, Any]:
        """
        지역 기준 매물 리스트 조회
        """
        path = "/api/articles"
        params = {
            "cortarNo": cortarNo,
            "page": page,
            "tradeType": trade_type,
            "realEstateType": real_estate_type,
        }
        return self._get_json(path, params=params)


# 사용 예시
if __name__ == "__main__":
    # Bearer 토큰은 브라우저 개발자 도구에서 Network 탭 확인
    # new.land.naver.com 접속 후 API 호출 시 Authorization 헤더 값 복사
    BEARER_TOKEN = "YOUR_BEARER_TOKEN_HERE"

    client = NaverLandClient(authorization_bearer=BEARER_TOKEN)

    # 래미안 퍼스티지 단지번호: 8928 (예시)
    # data = client.articles_by_complex(ArticleQuery(complex_no=8928))
    # print(data)
