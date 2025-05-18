import * as React from 'react';

function TestComponent() {
  return <p>This is a test: {process.env.CUSTOM_MESSAGE}</p>;
}

export default TestComponent;
