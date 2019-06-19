import React from 'react';
import Layout from '../components/Layout';
import Form from './Form';

export default function Main() {
  return (
    <Layout>
      <Form onSubmit={values => console.log('submit:', values)} />
    </Layout>
  );
}
