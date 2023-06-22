document.getElementById('username').innerText = localStorage['email'];

function redirectToHome() {
  localStorage.clear();
  window.location.href = '/';
}

function validateUser() {
  // validate token first => if not valid redirect to homepage
  if (localStorage.token) {
    getCurrentUser(localStorage.token)
      .then((res) => {
        console.log(res);
        if (res.status !== 401) {
          localStorage.setItem('email', res.email);
          document.getElementById('username').innerText = localStorage['email'];
        } else {
          redirectToHome();
        }
      })
      .catch((err) => {
        redirectToHome();
        console.log(err);
      });
  } else {
    redirectToHome();
  }
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

window.onload = () => {
  validateUser();
  // get all emails
  // getAllEmails(localStorage.token);
};

function getAllEmails(token) {
  fetch(SERVER_URL + '/home', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      console.log(res);
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error('Unauthorized');
      }
    })
    .then((data) => {
      console.log(data);
      // display all emails
      displayEmails(data);
    })
    .catch((err) => {
      console.log(err);
    });
}

function displayEmails(emails) {
  // JavaScript code to dynamically add rows to the table
  const tableBody = document.querySelector('tbody');

  // Loop through the emails and create table rows
  emails.forEach((email) => {
    const row = document.createElement('tr');
    row.innerHTML = `
                <td onclick='goToEmail(${email.id})'>${email.senderEmail}</td>
                <td onclick='goToEmail(${email.id})'>${email.subject}</td>
                <td onclick='goToEmail(${email.id})'>${email.createdAt}</td>
            `;
    tableBody.appendChild(row);
  });
}

function goToEmail(emailId) {
  localStorage.setItem('emailId', emailId);
  window.location.href = '/home/home_data.html';
}
