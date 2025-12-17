/**
 * Static configuration for adiga.kr API requests.
 * Update CSRF token and cookies when they expire.
 */

export const ADIGA_CONFIG = {
  // API endpoint
  endpoint: "https://www.adiga.kr/uct/acd/ade/criteriaAndResultItemAjax.do",

  // CSRF token - update when expired
  csrfToken: "34e0c7f4-7b69-47c1-bec9-bf333e6f8023",

  // Session cookies - update when expired
  cookies:
    "WMONID=-qvbvxcchhP; 1:1c6_1=1:1c6_1_to_609:6706; 1:1c3_2=1:1c3_2_to_609:6707; JSESSIONID=wLRf6ZTZ5GSawBAuldcKLlFy1hpVOjrCDpZK63Zl9XiuS0qntZJWk8xfOz4UweTe.amV1c19kb21haW4vYWRpZ2Ex",

  // Request headers
  headers: {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    Connection: "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",
    DNT: "1",
    Origin: "https://www.adiga.kr",
    Referer: "https://www.adiga.kr/uct/acd/ade/criteriaAndResultPopup.do",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "sec-ch-ua":
      '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
  },

  // Form data parameters (excluding dynamic unvCd)
  formParams: {
    searchSyr: "2026", // 2026 = 2025학년도 data
    searchStdClsfRgnCn: "",
    searchUnvNm: "",
    compUnvCd: "",
    searchUnvComp: "0",
    tsrdCmphSlcnArtclUpCd: "20", // 수시
    tsrdCmphSlcnArtclCd: "22",
  },
} as const;
