export const typeDefs = `
  type Movie {
    id: ID!
    title: String!
    year: Int!
    isWatched: Boolean!
  }

  type Query {
    movies: [Movie!]!
  }

  type Mutation {
    addMovie(title: String!, year: Int!): Movie
    toggleWatched(id: ID!): Movie
    deleteMovie(id: ID!): ID!
  }
`;

let movies = [
  { id: "1", title: "Inception", year: 2010, isWatched: false },
  { id: "2", title: "Interstellar", year: 2014, isWatched: true },
];

export const resolvers = {
  Query: {
    movies: () => movies,
  },
  Mutation: {
    addMovie: (_, { title, year }) => {
      const newMovie = {
        id: crypto.randomUUID(),
        title,
        year,
        isWatched: false,
      };
      movies.push(newMovie);
      return newMovie;
    },

    toggleWatched: (_, { id }) => {
      const movie = movies.find((m) => m.id === id);
      if (!movie) return null;
      movie.isWatched = !movie.isWatched;
      return movie;
    },

    deleteMovie: (_, { id }) => {
      movies = movies.filter((m) => m.id !== id);
      return id;
    },
  },
};
