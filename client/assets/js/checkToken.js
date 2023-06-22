window.onload = () => {
  console.log('localStorage.token: ', localStorage.token);
  // check if user is logged in
  if (localStorage.token) {
    getCurrentUser(localStorage.token)
      .then((res) => {
        console.log(res);
        if (res.status !== 401) {
          localStorage.setItem('email', res.email);
          // redirect to home page
          window.location.href = '/home';
        }
      })
      .catch((err) => {
        localStorage.clear();
        window.location.href = '/';
        console.log(err);
      });
  }
};
