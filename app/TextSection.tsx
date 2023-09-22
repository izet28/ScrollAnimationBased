"use client";

import React, { useRef } from "react";
import styled from "styled-components";
import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

const TextWrapper = ({ children }: Props) => {
  const text = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: text,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [1, 0.8, 0], [1, 1, 0]);
  const x = useTransform(scrollYProgress, [1, 0.4, 0], [0, 0, -1000]);
  return (
    <div ref={text}>
      <motion.p style={{ opacity, x }}>{children}</motion.p>
    </div>
  );
};

function TextSection() {
  return (
    <TextSectionStyled>
      <TextWrapper>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
        eius, recusandae eos optio vel cupiditate molestias!
      </TextWrapper>
      <TextWrapper>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
        eius, recusandae eos optio vel cupiditate molestias!
      </TextWrapper>
      <TextWrapper>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
        eius, recusandae eos optio vel cupiditate molestias!
      </TextWrapper>
      <TextWrapper>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
        eius, recusandae eos optio vel cupiditate molestias!
      </TextWrapper>
      <TextWrapper>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
        eius, recusandae eos optio vel cupiditate molestias!
      </TextWrapper>
    </TextSectionStyled>
  );
}

const TextSectionStyled = styled.section`
  p {
    font-size: 5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3rem;
  }
`;

export default TextSection;
