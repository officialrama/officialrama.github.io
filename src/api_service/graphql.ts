import { ApolloClient, InMemoryCache } from "@apollo/client";


const client = new ApolloClient({
    uri: 'https://wpe-hiring.tokopedia.net/graphql',
    cache: new InMemoryCache(),
  });


export default client;