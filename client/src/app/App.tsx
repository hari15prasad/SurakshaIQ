import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Providers } from 'shared/providers';
import { router } from './router';
import { loadCatalyst } from "services/loadCatalyst";

const App: React.FC = () => {
  useEffect(() => {
    loadCatalyst()
      .then((catalyst) => {
        console.log("Catalyst SDK loaded", catalyst);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
};

export default App;