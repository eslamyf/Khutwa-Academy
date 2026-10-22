import React from 'react';
import { ART } from '../../constants';

export function TrackArt({ course, id, img, alt = '' }) {
  const courseId = id || course?.id;
  const courseImg = img !== undefined ? img : course?.img;

  if (courseImg) {
    return <img src={courseImg} alt={alt} />;
  }

  return ART[courseId] || ART.gen;
}

export default TrackArt;
