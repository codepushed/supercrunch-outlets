import React from "react";
import styles from "./TummySection.module.css";
import TestimonialCard from "../Cards/TestimonialCard";
import * as reviewsData from "../../utils/reviews";

const TummySection = () => {
    return (
        <section className={styles.tummySection}>
            <div className={styles.tummySectionHeading}>
                <h1 className={styles.tummySectionHeadingText}>What Tummies</h1>
                <h1 className={styles.tummySectionHeadingSubText}>Are Saying</h1>
            </div>

            <div className={styles.testimonialGrid}>
                {reviewsData.default && Array.isArray(reviewsData.default) && reviewsData.default.map((review, index) => (
                    <div key={index} className={styles.testimonialItem}>
                        <TestimonialCard
                            testimonial={review.feedback}
                            name={review.name}
                            location={`${review.flatno}`}
                            avatar={`/images/${review.gender}AvatarSuper.png`}
                            gender={review.gender}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TummySection;
