import '@testing-library/jest-dom';

// Mock document methods needed for the tests
global.document = global.document || {
  createElement: () => ({
    click: () => {},
    href: '',
    download: '',
  }),
};

// Mock URL object
global.URL = global.URL || {
  createObjectURL: () => 'mock-blob-url',
  revokeObjectURL: () => {},
};
