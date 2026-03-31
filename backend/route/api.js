const express = require("express");

const router = express.Router();

// ใช้ค่าจาก .env
const BASE_URL = process.env.BASE_URL;
const COLLECTION = process.env.COLLECTION || "notes";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// เช็คกันพลาด
if (!BASE_URL || !ACCESS_TOKEN) {
  throw new Error("Missing BASE_URL or ACCESS_TOKEN in .env");
}

// helper สำหรับเรียก API กลาง
async function callPocketHost(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
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

// GET all notes
router.get("/notes", async (req, res) => {
  try {
    const { search = "" } = req.query;

    const data = await callPocketHost(
      `/api/collections/${COLLECTION}/records?perPage=500`,
      {
        method: "GET",
      }
    );

    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];

    const keyword = search.trim().toLowerCase();

    const filtered = keyword
      ? items.filter((note) => {
          const title = (note.title || note.text || "").toLowerCase();
          const content = (note.content || note.body || "").toLowerCase();
          return title.includes(keyword) || content.includes(keyword);
        })
      : items;

    res.status(200).json({
      items: filtered,
      totalItems: filtered.length,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to fetch notes",
      detail: error.message || error,
    });
  }
});

// GET one note by id
router.get("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await callPocketHost(
      `/api/collections/${COLLECTION}/records/${id}`,
      {
        method: "GET",
      }
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to fetch note",
      detail: error.message || error,
    });
  }
});


// CREATE note
router.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "title and content are required",
      });
    }

    const payload = { title, content };

    const data = await callPocketHost(
      `/api/collections/${COLLECTION}/records`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to create note",
      detail: error.message || error,
    });
  }
});


// UPDATE note
router.patch("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (content !== undefined) payload.content = content;

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        error: "At least one field is required to update",
      });
    }

    const data = await callPocketHost(
      `/api/collections/${COLLECTION}/records/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to update note",
      detail: error.message || error,
    });
  }
});


// DELETE note
router.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await callPocketHost(
      `/api/collections/${COLLECTION}/records/${id}`,
      {
        method: "DELETE",
      }
    );

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: "Failed to delete note",
      detail: error.message || error,
    });
  }
});

module.exports = router;