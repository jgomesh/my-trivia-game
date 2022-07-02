import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../Button';
import './Question.scss';

class Question extends Component {
  toggleQuestionClass = (answered, question, answer) => {
    if (!answered) {
      return '';
    }

    if (answered && question.includes(answer)) {
      return 'wrong';
    }

    return 'correct';
  }

  toggleTestId = (question, answer, index) => {
    if (question.incorrect_answers.includes(answer)) {
      return `wrong-answer-${index}`;
    }

    return 'correct-answer';
  }

  calculatePoints = (answer, question) => {
    const { timer, score } = this.props;
    const minPoints = 10;

    const pointsMeasure = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    if (answer === question.correct_answer) {
      const points = minPoints + (timer * pointsMeasure[question.difficulty]);
      return score + points;
    }

    return score;
  }

  calculateAssertions = (answer, question) => {
    const { assertions } = this.props;

    if (answer === question.correct_answer) {
      return assertions + 1;
    }

    return assertions;
  }

  calculateScore = (answer, question) => {
    const points = this.calculatePoints(answer, question);
    const assertions = this.calculateAssertions(answer, question);

    return { points, assertions };
  }

  createMarkup(question) {
    const p = document.createElement('textarea');
    p.innerHTML = question;
    return p.value;
  }

  render() {
    const { question, answered, handleClick, isDisabled } = this.props;

    const answers = question.sortedAnswers;

    return (
      <div className="question__container">

        <p className="question__container__category" data-testid="question-category">
          {question.category}
        </p>

        <p
          data-testid="question-text"
          className="question__container__questionText"
        >
          { this.createMarkup(question.question) }
        </p>

        <div
          className="question__container__buttons__container"
          data-testid="answer-options"
        >
          {answers.map((answer, index) => (
            <Button
              key={ answer }
              title={ this.createMarkup(answer) }
              disabled={ isDisabled }
              data-testid={ this.toggleTestId(question, answer, index) }
              className={
                this.toggleQuestionClass(answered, question.incorrect_answers, answer)
              }
              onClick={ () => handleClick(this.calculateScore(answer, question)) }
            />
          ))}
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  score: state.player.score,
  assertions: state.player.assertions,
});

export default connect(mapStateToProps)(Question);

Question.propTypes = {
  question: PropTypes.shape({
    category: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    correct_answer: PropTypes.string.isRequired,
    incorrect_answers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    sortedAnswers: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
  answered: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  score: PropTypes.number.isRequired,
  timer: PropTypes.number.isRequired,
  assertions: PropTypes.number.isRequired,
};
