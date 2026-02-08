import editalFomentoApi from './editalFomentoApi';

export async function getEditaisFomento(params) {
  const { data } = await editalFomentoApi.get('/editais-fomento', { params });
  return data;
}

export async function getEditalFomentoById(id) {
  const { data } = await editalFomentoApi.get(`/editais-fomento/${id}`);
  return data;
}

export async function getEstados() {
  const { data } = await editalFomentoApi.get('/editais-fomento/estados');
  return data;
}

export async function getEditaisFomentoStats() {
  const { data } = await editalFomentoApi.get('/editais-fomento/stats');
  return data;
}
