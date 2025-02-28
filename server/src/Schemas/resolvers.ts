import User from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';
//import { AuthenticationError } from 'apollo-server-express';
//import bcrypt from 'bcryptjs';
//import jwt from 'jsonwebtoken';



interface bookArgs {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
}//keep this


interface Context {//
    user?: User;
}//keep this

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: Context): Promise<User | null> => {
            if (context.user) {
                return await User.findOne({ _id: context.user._id });
            }
            throw AuthenticationError;
        },//keep this
    },
    Mutation: {
        addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }): Promise<{ token: string; user: User }> => {
            const user = await User.create({ username, email, password });
            //add away to catch errors if(!user){}
            const token = signToken(user.name, user.email, user._id);
            return { token, user };
        },//keep this
        login: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }): Promise<{ token: string; user: User }> => {
            const user = await User.findOne({ $or: [{ username }, { email }] });
            if (!user) {
                throw AuthenticationError;
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw AuthenticationError;
            }
            const token = signToken(user.username, user.password, user._id);
            return { token, user };
        },//keep this
        saveBook: async (_parent: any, { bookId, authors, description, title, image, link }: bookArgs, context: Context): Promise<User | null> => {
            if (context.user) {
                try {
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user.id },
                        { $addToSet: { savedBooks: { bookId, authors, description, title, image, link } } },
                        { new: true, runValidators: true }
                    );
                    return updatedUser;
                } catch (err) {
                    console.log(err);
                    return null;
                }
            } else {
                throw AuthenticationError;
            }
        },//keep this
        removeBook: async (_parent: any, { bookId }: {bookId:string}, context: Context): Promise<User | null> => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user.id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                  );
            } else {
            throw AuthenticationError;
            }
        },//keep
    },
};

export default resolvers;
/*
const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You are not authenticated');
      return await User.findById(user.id);
    },
  },
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new AuthenticationError('Invalid credentials');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AuthenticationError('Invalid credentials');

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return { token, user };
    },
    addUser: async (_, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return { token, user };
    },
    saveBook: async (_, { bookInput }, { user }) => {
      if (!user) throw new AuthenticationError('You are not authenticated');
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $push: { savedBooks: bookInput } },
        { new: true }
      );
      return updatedUser;
    },
    removeBook: async (_, { bookId }, { user }) => {
      if (!user) throw new AuthenticationError('You are not authenticated');
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      return updatedUser;
    },
  },
};

export default resolvers;

/*
interface ProfileArgs {
  profileId: string;
}

// ! Important for input types: We need to update the resolver arguments to accept the input types we defined in the typeDefs.
interface AddProfileArgs {
  profileInput: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    zipCode: string;
  };
}

interface SkillArgs {
  profileId: string;
  skill: string;
}

const resolvers = {
  Query: {
    me: async (_parent: unknown, { profileId }: ProfileArgs) => {
      return await User.findOne({ _id: profileId });
    },
  },

  Mutation: {

    // ! Important for input types: With the arguments updated to accept the input types, we can now destructure the profileInput object from the args object.
    addProfile: async (_parent: unknown, { profileInput }: AddProfileArgs) => {
      // We can now spread the profileInput object to the create method.
      return await Profile.create({ ...profileInput });
    },
    addSkill: async (_parent: unknown, { profileId, skill }: SkillArgs) => {
      return await Profile.findOneAndUpdate(
        { _id: profileId },
        {
          $addToSet: { skills: skill },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },
    removeProfile: async (_parent: unknown, { profileId }: ProfileArgs) => {
      return await Profile.findOneAndDelete({ _id: profileId });
    },
    removeSkill: async (_parent: unknown, { profileId, skill }: SkillArgs) => {
      return await Profile.findOneAndUpdate(
        { _id: profileId },
        { $pull: { skills: skill } },
        { new: true }
      );
    },
  },
};

export default resolvers;
*/