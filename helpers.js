// helpers.js para funções utilitárias do K6
import { check } from "k6";

export function checkStatus(response, expectedStatus = 200) {
  return check(response, {
    [`Status deve ser igual a ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

export function getAuthToken(response) {
  try {
    if (!response || typeof response.json !== 'function') return null;
    return response.json("token");
  } catch {
    return null;
  }
}
