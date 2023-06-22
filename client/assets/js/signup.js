document.getElementById('signup').addEventListener('submit', signup);

async function signup(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const fullName = document.getElementById('fullName').value;
  const birthday = document.getElementById('birthday').value;
  const password = document.getElementById('password').value;

  const result = await fetch(SERVER_URL + '/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, fullName, password, birthday }),
  }).then((res) => res.json());

  console.log(result);
  if (result && result.access_token) {
    localStorage.setItem('token', result.access_token);
    window.location.href = '/home';
  } else {
    alert(result.error);
  }
}
