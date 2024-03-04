import React from 'react';
import { Header as DSFRHeader } from '@codegouvfr/react-dsfr/Header';
import { Brand } from 'shared/constants';

const Header = () => {
  return (
    <DSFRHeader
      brandTop={
        <>
          Ministère
          <br />
          de l'Agriculture
          <br />
          et de la Souveraineté
          <br />
          alimentaire
        </>
      }
      homeLinkProps={{
        to: '/',
        title: 'Accueil',
      }}
      id="fr-header-simple-header-with-service-title-and-tagline"
      // serviceTagline="baseline - précisions sur l'organisation"
      serviceTitle={
        <>
          Plan de Surveillance
          <br />
          Plan de Contrôle
        </>
      }
    />
  );
};

export default Header;
