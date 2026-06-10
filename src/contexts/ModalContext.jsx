import { createContext, useState, useContext } from 'react';

const ModalContext = createContext({});

export const ModalProvider = ({ children }) => {
  const [atlModal, setAtlModal] = useState({ isOpen: false, movieId: null, movieTitle: '' });
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    movieId: null,
    movieTitle: '',
    isEdit: false,
  });

  // NOVOS ESTADOS:
  const [renameModal, setRenameModal] = useState({
    isOpen: false,
    watchListId: null,
    currentName: '',
  });
  const [membersModal, setMembersModal] = useState({
    isOpen: false,
    watchListId: null,
    watchListName: '',
    isOwner: false,
  });

  // Funções existentes...
  const openAtlModal = (movieId, movieTitle) => setAtlModal({ isOpen: true, movieId, movieTitle });
  const closeAtlModal = () => setAtlModal({ isOpen: false, movieId: null, movieTitle: '' });

  const openRatingModal = (movieId, movieTitle, isEdit = false) =>
    setRatingModal({ isOpen: true, movieId, movieTitle, isEdit });
  const closeRatingModal = () =>
    setRatingModal({ isOpen: false, movieId: null, movieTitle: '', isEdit: false });

  // NOVAS FUNÇÕES:
  const openRenameModal = (watchListId, currentName) =>
    setRenameModal({ isOpen: true, watchListId, currentName });
  const closeRenameModal = () =>
    setRenameModal({ isOpen: false, watchListId: null, currentName: '' });

  const openMembersModal = (watchListId, watchListName, isOwner) =>
    setMembersModal({ isOpen: true, watchListId, watchListName, isOwner });
  const closeMembersModal = () =>
    setMembersModal({ isOpen: false, watchListId: null, watchListName: '', isOwner: false });

  return (
    <ModalContext.Provider
      value={{
        atlModal,
        openAtlModal,
        closeAtlModal,
        ratingModal,
        openRatingModal,
        closeRatingModal,
        renameModal,
        openRenameModal,
        closeRenameModal,
        membersModal,
        openMembersModal,
        closeMembersModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
