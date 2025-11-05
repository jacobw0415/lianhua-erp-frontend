import * as React from 'react';
import { Admin, Resource, ListGuesser } from 'react-admin';
import dataProvider from './providers/dataProvider';
import Dashboard from './pages/dashboard';

const App = () => (
    <Admin dashboard={Dashboard} dataProvider={dataProvider}>
        <Resource name="suppliers" list={ListGuesser} />
        <Resource name="purchases" list={ListGuesser} />
        <Resource name="sales" list={ListGuesser} />
    </Admin>
);

export default App;
