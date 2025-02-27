const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { ethers } = require("ethers");
const userManagement = require('./src/utils/web3.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Test route
app.get('/', (req, res) => {
    res.send('Backend is up and running!');
});

// User registration route
app.post('/api/register', async (req, res) => {
    const { name, university, expertise, role } = req.body;

    try {
        const tx = await userManagement.registerUser(name, university, expertise,role);
        await tx.wait(); // Wait for transaction to be mined


        // const newUser = new User({ address, name, university, expertise, role });
        // await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'User registration failed' });
    }
});
app.get('/api/getUser/:address', async (req, res) => {
    const { address } = req.params;
    try {
      const user = await userManagement.getUser(address);
      console.log(user);

      const formattedUser = {
        name: user.name,
        university: user.university,
        expertise: user.expertise,
        role: user.role.toString(),          // Convert BigInt to string
        isVerified: user.isVerified,
        reputation: user.reputation.toString() // Convert BigInt to string
    };

    res.json(formattedUser);
     } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Error fetching user');
    }
  });

    // New route to verify user
    app.post('/api/verifyUser', async (req, res) => {
        try {
            const add=await userManagement.addUniversity("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
            await add.wait()
            const { userAddress } = req.body;
            const tx = await userManagement.verifyUser(userAddress);
            await tx.wait();


            // const updatedUser = await User.findOneAndUpdate(
            //     { address: userAddress },
            //     { isVerified: true },
            //     { new: true }
            // );
    
            // if (!updatedUser) {
            //     return res.status(404).json({ error: 'User not found' });
            // }
            res.status(200).send('User verified successfully');
        } catch (error) {
            console.error('Error verifying user:', error);
            res.status(500).send('Failed to verify user');
        }
    });

    // Update reputation endpoint
app.post('/api/updateReputation', async (req, res) => {
    const { userAddress, reputationPoints } = req.body;

    if (!userAddress || reputationPoints === undefined) {
        return res.status(400).json({ error: 'Missing user address or reputation points' });
    }

    try {
        const tx = await userManagement.updateReputation(userAddress, reputationPoints);
        await tx.wait();

        // const updatedUser = await User.findOneAndUpdate(
        //     { address: userAddress },
        //     { $inc: { reputation: reputationPoints } },
        //     { new: true }
        // );

        // if (!updatedUser) {
        //     return res.status(404).json({ error: 'User not found' });
        // }

        res.status(200).json({ message: 'Reputation updated successfully', transaction: tx.hash });
    } catch (error) {
        console.error('Error updating reputation:', error);
        res.status(500).json({ error: error.reason || 'Internal server error' });
    }
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
