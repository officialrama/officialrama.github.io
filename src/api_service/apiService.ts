import { gql, ApolloError } from '@apollo/client';
import client from './graphql'; // Import your Apollo Client instance

interface ContactList {
    created_at: string;
    first_name: string;
    id: number;
    last_name: string;
    phones: { number: string }[];
    favorite: boolean;
    searchText: string;
  } 

  export async function getContactList(
    offset: number,
    limit: number, 
    order_by: any, 
    where: any,
  ): Promise<ContactList[] | null> {
    const GET_CONTACT_LIST = gql`
      query GetContactList(
        $distinct_on: [contact_select_column!]
        $limit: Int
        $offset: Int
        $order_by: [contact_order_by!]
        $where: contact_bool_exp
      ) {
        contact(
          distinct_on: $distinct_on
          limit: $limit
          offset: $offset
          order_by: $order_by
          where: $where
        ) {
          created_at
          first_name
          id
          last_name
          phones {
            number
          }
        }
      }
    `;
    try {
      const response = await client.query({
        query: GET_CONTACT_LIST,
        variables: {
          distinct_on: [], 
          limit: limit,
          offset: offset,
          order_by: order_by,
          where: where,
        },
      });
      return response?.data?.contact;
    } catch (error) {
      console.error('Error fetching contact list:', error);
    }
    return null;
  }

    export async function getContactDetail(id: number): Promise<ContactList | null> {
        const GET_CONTACT_DETAIL = gql`
        query GetContactDetail($id: Int!){
            contact_by_pk(id: $id) {
            last_name
            id
            first_name
            created_at
            phones {
              number
            }
          }
        }
        `;
        try {
            const response = await client.query({ query: GET_CONTACT_DETAIL, variables: { id } });
            return response?.data?.contact_by_pk;
          } catch (error) {
            console.error('Error fetching contact list:', error);
          }
          return null
        }
    
        export async function updateContact(id: number, fields: Partial<ContactList>): Promise<ContactList | null> {
            const UPDATE_CONTACT = gql`
              mutation UpdateContactById($id: Int!, $_set: contact_set_input) {
                update_contact_by_pk(pk_columns: { id: $id }, _set: $_set) {
                  first_name
                  last_name
                  phones {
                    number
                  }
                }
              }
            `;
            const updatedFields = {
              first_name: fields.first_name,
              last_name: fields.last_name,
            };
          
            try {
              const response = await client.mutate({
                mutation: UPDATE_CONTACT,
                variables: { id, _set: updatedFields },
              });
              return response?.data?.update_contact_by_pk;
            } catch (error) {
              console.error('Error updating contact:', error);
              return null;
            }
          }

          export async function createdContact(contactData: any): Promise<ContactList | null> {
            const CREATED_CONTACT = gql`
              mutation AddContactWithPhones(
                $first_name: String!, 
                $last_name: String!, 
                $phones: [phone_insert_input!]!
              ) {
                insert_contact(
                  objects: {
                    first_name: $first_name, 
                    last_name: $last_name, 
                    phones: { data: $phones }
                  }
                ) {
                  returning {
                    id
                    first_name
                    last_name
                    phones {
                      number
                    }
                  }
                }
              }
            `;
            try {
              const response = await client.mutate({
                mutation: CREATED_CONTACT,
                variables: {
                  first_name: contactData.first_name,
                  last_name: contactData.last_name,
                  phones: contactData.phones
                }
              });
              return response?.data?.insert_contact?.returning[0];
            } catch (error) {
              console.error('Error creating contact:', error);
            }
            return null;
          }

          export async function deleteContact(id: number): Promise<ContactList | null> {
           
            const DELETE_CONTACT = gql`
              mutation MyMutation($id: Int!) {
                delete_contact_by_pk(id: $id) {
                  first_name
                  last_name
                  id
                }
              }
            `;
            try {
              const response = await client.mutate({
                mutation: DELETE_CONTACT,
                variables: {
                  id: id
                }
              });
              return response?.data?.delete_contact_by_pk;
            } catch (error) {
              console.error('Error deleting contact:', error);
            }
            return null;
          }

        //   export async function searchContact(searchText: string): Promise<ContactList | null> {
        //     const SEARCH_CONTACT = gql`
        //     query GetPhoneList(
        //         $where: phone_bool_exp, 
        //         $distinct_on: [phone_select_column!], 
        //         $limit: Int = 10, 
        //         $offset: Int = 0, 
        //         $order_by: [phone_order_by!]
        //     ) {
        //       phone(where: $where, distinct_on: $distinct_on, limit: $limit, offset: $offset, order_by: $order_by) {
        //         contact {
        //           last_name
        //           first_name
        //           id
        //         }
        //         number
        //       }
        //     }
        //     `;
        //     const whereClause = {
        //         contact: {
        //           first_name: {
        //             _like: `%${searchText}%`
        //           }
        //         }
        //       };
        //      console.log('search',searchText)
        //       try {
        //         const response = await client.query({
        //           query: SEARCH_CONTACT,
        //           variables: {
        //             where: whereClause,
        //           }
        //         });
        //         return response?.data?.phone;
        //       } catch (error) {
        //         console.error('Error fetching contact list:', error);
        //       }
        //       return null;
        //     }