const SERVER_URL = '/api';
/**
 * validate user token and get current uers info
 * @param {string} token
 * @returns response object if 'unauthorized' request
 * or js object contains user info
 */
async function getCurrentUser(token) {
  const response = await fetch(SERVER_URL + '/auth/check', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status != 200) {
    return response;
  }
  return response.json(); // return user info
}
