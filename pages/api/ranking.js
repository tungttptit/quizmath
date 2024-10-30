// pages/api/ranking.js
let ranks = [];

export default function handler(req, res) {
  if (req.method === "GET") {
    // Get all ranks
    res.status(200).json(ranks);
  } else if (req.method === "POST") {
    // Create a new rank
    const { title, content } = req.body;
    const newRank = { id: ranks.length + 1, title, content };
    ranks.push(newRank);
    res.status(201).json(newRank);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}