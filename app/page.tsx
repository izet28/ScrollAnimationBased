"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Header from "./Components/Header/Header";
import styled from "styled-components";
import SectionLayout from "./Components/SectionLayout";
import Card from "./Components/Card";
import { cards } from "./utils/card";
import Fullpage from "./Components/Fullpage";
import TextSection from "./TextSection";
import Footer from "./Components/Footer";
import ZoomSection from "./Components/ZoomSection";
import HorizontalWrapper from "./Components/HorizontalWrapper";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const video = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: video,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.65, 0], [1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.65, 0.8, 0.9],
    [1, 0.8, 0.8, 0]
  );
  return (
    <>
      <Header />
      <MainStyled>
        <SectionLayout>
          <HorizontalWrapper height="45rem" direction={-1400}>
            <div className="cards">
              {cards.map((card, index) => {
                return (
                  <Card
                    key={index}
                    title={card.title}
                    description={card.description}
                    image={card.image}
                  />
                );
              })}
            </div>
          </HorizontalWrapper>
        </SectionLayout>
        <Fullpage />
        <SectionLayout>
          <HorizontalWrapper height="45rem" direction={1400}>
            <div className="cards" style={{ right: 0 }}>
              {cards.map((card, index) => {
                return (
                  <Card
                    key={index}
                    title={card.title}
                    description={card.description}
                    image={card.image}
                  />
                );
              })}
            </div>
          </HorizontalWrapper>
        </SectionLayout>
        <SectionLayout>
          <TextSection />
        </SectionLayout>
        <SectionLayout>
          <motion.div className="video" ref={video} style={{ opacity, scale }}>
            <iframe
              src="https://www.youtube.com/embed/T6tc7TT13is&t=5142s"
              title="youtube video"
              allow="acceleromater; autoplay;clipboard-write;encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </motion.div>
        </SectionLayout>
        <SectionLayout>
          <ZoomSection></ZoomSection>
        </SectionLayout>
        <SectionLayout>
          <TextSection />
        </SectionLayout>
        <Footer />
      </MainStyled>
    </>
  );
}

const MainStyled = styled.main`
  min-height: 100vh;
  width: 100%;

  .cards {
    position: absolute;
    display: grid;
    grid-template-columns: repeat(5, 30rem);
    gap: 4rem;
  }

  .video {
    padding: 2rem;
    background-color: #161616;
    border-radius: 1rem;
    iframe {
      border: none;
      width: 100%;
      height: 52rem;
    }
  }
`;
