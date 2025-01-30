const updateSSD2Referential = async () => {

  console.log('Updating SSD2…')





};

export default updateSSD2Referential()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
