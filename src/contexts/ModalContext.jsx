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
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    isDanger: false,
    onConfirm: null, // A função que será executada!
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

  const openConfirmModal = (options) => {
    setConfirmModal({
      isOpen: true,
      title: options.title || 'Atenção',
      message: options.message || 'Deseja continuar?',
      confirmText: options.confirmText || 'Confirmar',
      isDanger: options.isDanger || false,
      onConfirm: options.onConfirm || null,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

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
        confirmModal,
        openConfirmModal,
        closeConfirmModal
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
