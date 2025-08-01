import React from 'react'
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ExamDash = () => {
  const { exam_cat, exam_name } = useParams();

    const removeSlug = (text) => {
        return text.replaceAll('-', ' ');
    }

  return (
    <div>
        <Navbar />
        <div>{removeSlug(exam_cat)}</div>
        <div>{removeSlug(exam_name)}</div>
    </div>
  )
}

export default ExamDash;