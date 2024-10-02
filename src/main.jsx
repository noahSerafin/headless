import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import App from './App.jsx'
import './index.css'
const serveruri = 'http://localhost/wp-headless/server/graphql';

//'http://localhost/wp-headless/server/graphql'
//'https://flyby-router-demo.herokuapp.com/'
const client = new ApolloClient({
  uri: serveruri,
  cache: new InMemoryCache(),
});

client
  .query({
    query: gql`
    {
      songs{
        edges{
          node{
            title,
            songMeta{
              artist,
              coverArt{
                node{
                  uri
                }
              }
              file{
                node{
                  uri
                }
              }
              bpm
            }
          }
        }
      }
    }
    `,
  })
.then((result) => console.log(result));

createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <App serveruri={serveruri}/>
  </ApolloProvider>,
)