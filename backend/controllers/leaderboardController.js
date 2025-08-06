// backend/controllers/leaderboardController.js

const CodeQuestion = require("../models/codeQuestion");
const User = require("../models/User"); // We need the User model to get names and photos

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await CodeQuestion.aggregate([
      // Stage 1: Filter for only solved questions
      {
        $match: { status: "Solved" },
      },
      // Stage 2: Group by user and calculate total score based on difficulty
      {
        $group: {
          _id: "$userId",
          totalScore: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ["$difficulty", "Easy"] }, then: 10 },
                  { case: { $eq: ["$difficulty", "Medium"] }, then: 25 },
                  { case: { $eq: ["$difficulty", "Hard"] }, then: 50 },
                ],
                default: 0,
              },
            },
          },
        },
      },
      // Stage 3: Sort by the highest score
      {
        $sort: { totalScore: -1 },
      },
      // Stage 4: Limit to the top 20 participants
      {
        $limit: 20,
      },
      // Stage 5: Join with the 'users' collection to get user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      // Stage 6: Deconstruct the userInfo array
      {
        $unwind: "$userInfo",
      },
      // Stage 7: Project the final fields we need for the frontend
      {
        $project: {
          _id: 1, // Keep the userId
          totalScore: 1,
          name: "$userInfo.name",
          photo: "$userInfo.profileImageUrl", // <-- Change to match your schema
        },
      },
    ]);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
