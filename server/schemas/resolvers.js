// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.

const { Pet, User } = require("../models");
const jwt = require("jsonwebtoken");
// const secret = process.env.JWT_SECRET;
const secret = "secrets goes here"

/** @type {ApolloServerOptionsWithTypedefs} */
const resolvers = {
  Query: {
    books: () => [
      { title: "book1", author: "author1" },
      { title: "book2", author: "author2" },
      { title: "book3", author: "author3" },
      { title: "book4", author: "author4" },
      { title: "book5", author: "author5" },
    ],
    pets: async () => {
      try {
        const pets = await Pet.find();
        return pets.map((pet) => ({
          id: pet._id.toString(),
          name: pet.name,
          age: pet.age,
          breed: pet.breed,
        }));
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    pet: async (parent, { id, ownerEmail }) => {
      try {
        let pet;
        if (id) {
          pet = await Pet.findById(id);
        } else if (ownerEmail) {
          pet = await Pet.findOne({ ownerEmail });
        }
        if (!pet) {
          throw new Error("Pet not found");
        }
        return {
          id: pet._id.toString(),
          name: pet.name,
          age: pet.age,
          breed: pet.breed,
          ownerEmail: pet.ownerEmail,
        };
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  },

  Mutation: {
    addPet: async (parent, { input }) => {
      try {
        const pet = new Pet(input);
        await pet.save();
        return {
          id: pet._id.toString(),
          name: pet.name,
          age: pet.age,
          breed: pet.breed,
          ownerEmail: pet.ownerEmail,
        };
      } catch (error) {
        console.log(error);
        return null;
      }
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
  
      if (!user) {
        throw new AuthenticationError('User not found');
      }
  
      const correctPw = await user.isCorrectPassword(password);
  
      if (!correctPw) {
        throw new AuthenticationError('Incorrect password')
      }
  
      const token = signToken(user);
      return { token, user };
  
    },

    // signup: async (parent, args) => {
    //   try {
    //     const user = await User.create(args);
    //     const token = jwt.sign(
    //       {
    //         email: user.email,
    //         id: user._id,
    //       },
    //       secret,
    //       { expiresIn: "2h" }
    //     );
    //     return {
    //       token,
    //       user
    //     }
    //   }
    //   catch (error) {
    //     console.error(error);

    //   }
    // }

    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    
  },
};

module.exports = resolvers;
