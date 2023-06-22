document.getElementById('login').addEventListener('submit', login);

async function login(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const result = await fetch(SERVER_URL + '/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password,
    }),
  }).then((res) => res.json());

  console.log(result);
  if (result && result.access_token) {
    localStorage.setItem('token', result.access_token);
    window.location.href = '/home';
  } else {
    alert(result.error);
  }
}
