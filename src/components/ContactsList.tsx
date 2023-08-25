import React,{ useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import indigo from '@material-ui/core/colors/indigo';
import DeleteDialog from './DeleteDialog';
import { getContactList, deleteContact, updateContact } from '../api_service/apiService';

const useContactItemsStyles = makeStyles({
  itemGutters: {
    padding: 0
  },
  textSecondary: {
    '& span': {
      display: 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  },
  avatarFlex: {
    margin: 'auto'
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
  id: number
  name: string;
  email: string;
  telephone: string;
  favorite: boolean;
  slug: string;
}

interface ContactItemProps {
  dataUser : ContactList;
  toggleFavorite: (id: number, first_name: string) => void;
  children: React.ReactNode;
}

function ContactItem({ dataUser,  children, toggleFavorite }: ContactItemProps): JSX.Element {
  const [contactsShow, setContactsShow] = useState<ContactList[]>([]);
  const { first_name, created_at, last_name, id, favorite} = dataUser
  const classes = useContactItemsStyles();
  const navigate = useNavigate();



  const handleClick = async () => {
    navigate(`/edit/${id}`);
  };
   
  return (
    <ListItem
      alignItems="flex-start"
      onClick={handleClick} // Use the updated click event handler
      classes={{ gutters: classes.itemGutters }}
    >
      <ListItemAvatar style={{ alignItems: 'flex-start' }}>
      <IconButton
      onClick={e => {
        e.stopPropagation();
        toggleFavorite(id, first_name);
        
      }}
      className={classes.button}
    >
      {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
      </ListItemAvatar>
      <ListItemText
        classes={{ secondary: classes.textSecondary }}
        primary={first_name}
        secondary={
          <>
            <Typography component="span">{first_name}</Typography>
            <Typography component="span">{id}</Typography>
          </>
        }
      />
      <ListItemSecondaryAction>{children}</ListItemSecondaryAction>
    </ListItem>
  );
}

interface ContactsListProps {
  data?: ContactList[];
  toggleFavorite: (id: number, first_name: string) => void;
}
function ContactsList({ data, toggleFavorite }: ContactsListProps): JSX.Element {
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
          setContactsShow(contactList); // Update the state with the new contactList
          
      
        }
      } catch (error) {
        console.error('Error fetching contact list:', error);
      }
    }
  };
  return (
    <List>
      {data?.map(dataUser => (
        <React.Fragment key={dataUser.id}>
          <ContactItem dataUser={dataUser} toggleFavorite={toggleFavorite}>
            <DeleteDialog
              id={dataUser.id}
              name={dataUser.first_name}
              onConfirm={() => handleDeleteContact(dataUser.id)}
            />
          </ContactItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

export default ContactsList;
