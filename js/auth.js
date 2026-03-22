const loginForm = document.getElementById("loginForm");
const forgotLink = document.getElementById("forgotLink");
const forgotPanel = document.getElementById("forgotPanel");
const forgotForm = document.getElementById("forgotForm");
const forgotMessage = document.getElementById("forgotMessage");
const signupToggle = document.getElementById("signupToggle");
const signupPanel = document.getElementById("signupPanel");
const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

const demoAccounts = {
  instructor: {
    email: "instructor@smartlearn.in",
    password: "Instructor@123"
  },
  admin: {
    email: "admin@smartlearn.in",
    password: "Admin@123"
  }
};

function showError(fieldName, message) {
  const field = document.getElementById(fieldName);
  const errorElement = document.querySelector('[data-error-for="' + fieldName + '"]');
  if (!field || !errorElement) {
    return;
  }
  if (message) {
    field.classList.add("field-invalid");
    errorElement.textContent = message;
  } else {
    field.classList.remove("field-invalid");
    errorElement.textContent = "";
  }
}

function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Email is required";
  }
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(trimmed)) {
    return "Enter a valid email address";
  }
  return "";
}

function validatePassword(value) {
  if (!value) {
    return "Password is required";
  }
  if (value.length < 6) {
    return "Password must be at least 6 characters";
  }
  return "";
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  if (!loginForm) {
    return;
  }
  const emailValue = loginForm.email.value;
  const passwordValue = loginForm.password.value;
  const emailError = validateEmail(emailValue);
  const passwordError = validatePassword(passwordValue);
  showError("email", emailError);
  showError("password", passwordError);
  const isValid = !emailError && !passwordError;
  if (!isValid) {
    return;
  }
  const role = loginForm.role.value || "student";
  try {
    const response = await fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: role,
        email: emailValue,
        password: passwordValue
      })
    });
    const data = await response.json();
    if (!data.success) {
      showError("password", data.message || "Login failed");
      return;
    }
    window.localStorage.setItem("smartlearn-user-role", role);
    window.localStorage.setItem("smartlearn-session-role", role);
    window.localStorage.setItem("smartlearn-user-name", data.name || "");
    if (role === "admin") {
      window.location.href = "dashboard-admin.html";
    } else if (role === "instructor") {
      window.location.href = "dashboard-student.html";
    } else {
      window.location.href = "dashboard-student.html";
    }
  } catch (err) {
    console.error(err);
    showError("password", "Cannot reach backend. Make sure server is running.");
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLoginSubmit);
}

function handleSignupToggle(event) {
  event.preventDefault();
  if (!signupPanel) {
    return;
  }
  const currentDisplay = signupPanel.style.display;
  signupPanel.style.display = currentDisplay === "none" || currentDisplay === "" ? "block" : "none";
}

async function handleSignupSubmit(event) {
  event.preventDefault();
  if (!signupForm) {
    return;
  }
  const nameValue = signupForm.signupName.value;
  const emailValue = signupForm.signupEmail.value;
  const passwordValue = signupForm.signupPassword.value;
  const confirmValue = signupForm.signupConfirm.value;
  const trimmedName = nameValue.trim();
  const nameError = trimmedName ? "" : "Name is required";
  const emailError = validateEmail(emailValue);
  const passwordError = validatePassword(passwordValue);
  const confirmError = passwordValue && confirmValue === passwordValue ? "" : "Passwords do not match";
  const signupErrors = {
    signupName: nameError,
    signupEmail: emailError,
    signupPassword: passwordError,
    signupConfirm: confirmError
  };
  Object.keys(signupErrors).forEach(function (key) {
    showError(key, signupErrors[key]);
  });
  const hasError = nameError || emailError || passwordError || confirmError;
  if (hasError) {
    if (signupMessage) {
      signupMessage.textContent = "";
    }
    return;
  }
  try {
    const response = await fetch("http://localhost:4000/api/signup-student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: trimmedName,
        email: emailValue,
        password: passwordValue
      })
    });
    const data = await response.json();
    if (!data.success) {
      showError("signupEmail", data.message || "Signup failed");
      if (signupMessage) {
        signupMessage.textContent = "";
      }
      return;
    }
    if (signupMessage) {
      signupMessage.textContent = data.message || "Student account created. You can now log in.";
    }
    showError("signupName", "");
    showError("signupEmail", "");
    showError("signupPassword", "");
    showError("signupConfirm", "");
  } catch (err) {
    console.error(err);
    if (signupMessage) {
      signupMessage.textContent = "Cannot reach backend. Make sure server is running.";
    }
  }
}

function handleForgotClick(event) {
  event.preventDefault();
  if (!forgotPanel) {
    return;
  }
  const currentDisplay = forgotPanel.style.display;
  forgotPanel.style.display = currentDisplay === "none" ? "block" : "none";
  if (forgotPanel.style.display === "block" && loginForm) {
    const loginEmail = loginForm.email.value.trim();
    const forgotEmail = document.getElementById("forgotEmail");
    if (forgotEmail && loginEmail) {
      forgotEmail.value = loginEmail;
    }
  }
}

function handleForgotSubmit(event) {
  event.preventDefault();
  if (!forgotForm) {
    return;
  }
  const emailField = document.getElementById("forgotEmail");
  if (!emailField) {
    return;
  }
  const emailValue = emailField.value;
  const error = validateEmail(emailValue);
  const errorElement = document.querySelector('[data-error-for="forgotEmail"]');
  if (errorElement) {
    errorElement.textContent = error;
  }
  if (error) {
    return;
  }
  if (errorElement) {
    errorElement.textContent = "";
  }
  if (forgotMessage) {
    forgotMessage.textContent = "A reset link has been sent to " + emailValue + " (demo).";
  }
}

if (forgotLink) {
  forgotPanel.style.display = "none";
  forgotLink.addEventListener("click", handleForgotClick);
}

if (forgotForm) {
  forgotForm.addEventListener("submit", handleForgotSubmit);
}

if (signupToggle && signupPanel) {
  signupPanel.style.display = "none";
  signupToggle.addEventListener("click", handleSignupToggle);
}

if (signupForm) {
  signupForm.addEventListener("submit", handleSignupSubmit);
}
