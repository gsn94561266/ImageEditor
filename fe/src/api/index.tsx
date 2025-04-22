import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchTemplate = async () => {
  try {
    const response = await axios.get(`${API_URL}/getTemplate`);
    return response.data;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
};

export const createTemplate = async (templateData: any) => {
  try {
    const response = await axios.post(
      `${API_URL}/createTemplate`,
      templateData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

export const deleteTemplate = async (templateId: string) => {
  try {
    const response = await axios.post(`${API_URL}/deleteTemplate`, {
      id: templateId,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

export const fetchFile = async (url: string) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return {
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
};

export const uploadFile = async (api: string, formData: FormData) => {
  try {
    const response = await axios.post(api, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
