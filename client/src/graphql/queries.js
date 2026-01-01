import { gql } from "@apollo/client";

export const GET_MOVIES = gql`
  query {
    movies {
      id
      title
      year
      isWatched
    }
  }
`;

export const ADD_MOVIE = gql`
  mutation ($title: String!, $year: Int!) {
    addMovie(title: $title, year: $year) {
      id
      title
      year
      isWatched
    }
  }
`;

export const TOGGLE_WATCHED = gql`
  mutation ($id: ID!) {
    toggleWatched(id: $id) {
      id
      isWatched
    }
  }
`;

export const DELETE_MOVIE = gql`
  mutation ($id: ID!) {
    deleteMovie(id: $id)
  }
`;
