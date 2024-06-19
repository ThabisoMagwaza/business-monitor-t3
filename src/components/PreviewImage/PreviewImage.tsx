import * as React from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';

import styled from 'styled-components';
import Loader from '../Loader';

type PreviewImageProps = {
  src: string;
  alt: string;
};

function PreviewImage({ src, alt }: PreviewImageProps) {
  const { pending } = useFormStatus();

  return (
    <OuterWrapper>
      <Wrapper src={src} alt={alt} width={400} height={400} />
      {pending && (
        <Overlay>
          <Loader />
        </Overlay>
      )}
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: black;
  opacity: 0.6;

  display: grid;
  place-items: center;
`;

const Wrapper = styled(Image)`
  height: auto;
`;

export default PreviewImage;
