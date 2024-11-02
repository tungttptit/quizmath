// pages/api/ranking.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
let client;
let db;

// Kết nối tới MongoDB một lần và tạo chỉ mục duy nhất cho user_id
async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("mydatabase"); // Đặt tên database của bạn

    // Tạo chỉ mục duy nhất cho user_id dưới dạng chuỗi
    await db.collection("rankings").createIndex({ user_id: 1 }, { unique: true });
  }
  return db;
}

export default async function handler(req, res) {
  const db = await connectToDatabase();
  const rankingsCollection = db.collection("rankings");

  if (req.method === "GET") {
    const { user_id } = req.query;

    if (user_id) {
      // Tìm kiếm ranking theo user_id
      const ranking = await rankingsCollection.findOne({ user_id });
      if (!ranking) {
        return res.status(404).json({ error: "User ID not found" });
      }
      console.log(ranking);
      res.status(200).json(ranking);
    }else {
      // Lấy tất cả rankings từ MongoDB
    const rankings = await rankingsCollection.find({}).toArray();
    res.status(200).json(rankings);
    }
  } else if (req.method === "POST") {
    // Thêm một ranking mới với user_id duy nhất
    const { user_id, name, score } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (typeof user_id !== "string" || typeof name !== "string" || typeof score !== "number") {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const newRanking = { user_id, name, score, createdAt: new Date() };

    try {
      await rankingsCollection.insertOne(newRanking);
      res.status(201).json(newRanking);
    } catch (error) {
      if (error.code === 11000) {
        // Xử lý lỗi trùng lặp user_id
        res.status(409).json({ error: "User ID already exists" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}