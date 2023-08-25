import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { TableRow, TableCell, IconButton, Table, TableBody } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import DeleteDialog from './DeleteDialog';
import { deleteContact, getContactList } from '../api_service/apiService';
import ContactsList from './ContactsList';

const useStyles = makeStyles({
  row: {
    '&:hover': {
      backgroundColor: grey[100],
      cursor: 'pointer'
    }
  },
  button: {
    '&:hover': {
      backgroundColor: indigo[100]
    }
  }
});

interface ContactList {
    created_at: string;
    first_name: string;
    id: number;
    last_name: string;
    phones: { number: string }[];
    favorite: boolean;
  } 

interface Contact {
  slug: string;
  name: string;
  email: string;
  telephone: string;
  favorite: boolean;
}

interface ContactRowProps {
  dataUser: ContactList;  
  toggleFavorite: (id: number, first_name: string) => void;
  children: React.ReactNode;
}

function ContactRow({ dataUser, children, toggleFavorite }: ContactRowProps): JSX.Element {
  const [contacts, setContacts] = useState<ContactList[]>([]);
  const { created_at, first_name, id, last_name, phones, favorite} = dataUser;
  const classes = useStyles();
  const navigate = useNavigate();

  


  return (
    <TableRow
      className={classes.row}
      onClick={() => navigate(`/edit/${id}`)}
    >
      <TableCell>
      <IconButton
      onClick={e => {
        e.stopPropagation();
        toggleFavorite(dataUser.id, dataUser.first_name)
      
      }}
      className={classes.button}
    >
      {dataUser.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    
    </IconButton>
      </TableCell>

      <TableCell>{first_name} {last_name}</TableCell>
      <TableCell>
      {phones.slice(0, 2).map((phone, index) => (
        <div key={index}>{phone.number}</div>
      ))}
      {phones.length > 2 && <div>...</div>}
    </TableCell>
      <TableCell>{id}</TableCell>
      <TableCell>{children}</TableCell>    
      </TableRow>
  );
}

interface ContactsTableProps {
  data: ContactList[];
  toggleFavorite: ( id: number, first_name: string) => void;
  deleteContact: (id: number) => void
}

function ContactsTable({ data, toggleFavorite }: ContactsTableProps): JSX.Element {
  const [contactsShow, setContactsShow] = useState<ContactList[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 10; 
  const handleDeleteContact = async (id: number) => {
    const deletedContact = await deleteContact(id);
    if (deletedContact) {
      try {
        const contactList = await getContactList(
          offset,
          limit,
          { created_at: 'desc' },
          {}
        );
        if (contactList) {
          setContactsShow(contactList); 
 
        }
      } catch (error) {
        console.error('Error fetching contact list:', error);
      }
    }
  }; 

    
  return (
    <Table>
      <TableBody>
        {data.map(dataUser => (
        <React.Fragment key={dataUser.id}>
          <ContactRow
            key={dataUser.first_name}
            dataUser={dataUser}
            toggleFavorite={toggleFavorite}
          >
            <DeleteDialog
              id={dataUser.id}
              name={dataUser.first_name}
              onConfirm={() => handleDeleteContact(dataUser.id)}
            />
          </ContactRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

export default ContactsTable;
