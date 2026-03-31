const express = require("express");

const router = express.Router();

const BASE_URL = process.env.BASE_URL;
const USERS_COLLECTION = "users";

// helper เรียก PocketHost / PocketBase API
async function callPocketHost(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { raw: text };
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: data,
    };
  }

  return data;
}

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, passwordConfirm, name } = req.body;

    if (!email || !password || !passwordConfirm) {
      return res.status(400).json({
        error: "email, password and passwordConfirm are required",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        error: "password and passwordConfirm do not match",
      });
    }

    const payload = {
      email,
      password,
      passwordConfirm,
      name: name || "",
      emailVisibility: true,
    };

    const data = await callPocketHost(`/api/collections/${USERS_COLLECTION}/records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    res.status(201).json({
      message: "Register successful",
      user: data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to register",
      detail: error.message || error,
    });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required",
      });
    }

    const data = await callPocketHost(
      `/api/collections/${USERS_COLLECTION}/auth-with-password`,
      {
        method: "POST",
        body: JSON.stringify({
          identity: email,
          password,
        }),
      }
    );

    res.status(200).json({
      message: "Login successful",
      token: data.token,
      user: data.record,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to login",
      detail: error.message || error,
    });
  }
});

//GET CURRENT USER
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authorization token is required",
      });
    }

    const data = await callPocketHost(`/api/collections/${USERS_COLLECTION}/auth-refresh`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    res.status(200).json({
      message: "Current user fetched successfully",
      token: data.token,
      user: data.record,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to fetch current user",
      detail: error.message || error,
    });
  }
});

module.exports = router;