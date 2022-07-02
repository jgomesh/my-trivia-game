import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Header from '../../components/Header';
import Button from '../../components/Button';
import './Feedback.scss';
import sadFeedback from '../../assets/images/sad-feedback.svg';
import happyFeedback from '../../assets/images/happy-feedback.svg';

class Feedback extends Component {
  redirect = (path) => {
    const { history } = this.props;
    history.push(path);
  }

  toggleFeedbackText(assertions) {
    const minAssertionsQuantity = 3;

    if (assertions < minAssertionsQuantity) {
      return 'Could be better...';
    }

    return 'Well Done!';
  }

  render() {
    const { assertions, score } = this.props;
    const minAssertions = 3;
    return (
      <div className="feedback__container">
        <Header />
        <main className="feedback__container__content">
          <div className="feedback__container__content__header">
            <h1
              data-testid="feedback-text"
              className="feedback__container__content__feedbackText"
            >
              { this.toggleFeedbackText(assertions) }
            </h1>
            <img
              src={ assertions < minAssertions ? sadFeedback : happyFeedback }
              alt={ assertions < minAssertions ? 'sad neon emote' : 'happy neon emote' }
            />
          </div>
          <p
            data-testid="feedback-total-question"
            className="feedback__container__assertions"
          >
            { `Right answers: ${assertions}` }
          </p>
          <p
            data-testid="feedback-total-score"
            className="feedback__container__score"
          >
            { `Final score: ${score}` }
          </p>
          <div className="feedback__container__content__buttonsContainer">
            <Button
              type="button"
              title="Play Again"
              data-testid="btn-play-again"
              onClick={ () => this.redirect('/') }
            />
            <Button
              type="button"
              title="Ranking"
              data-testid="btn-ranking"
              onClick={ () => this.redirect('/ranking') }
            />
          </div>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  assertions: state.player.assertions,
  score: state.player.score,
});

Feedback.propTypes = {
  assertions: PropTypes.number.isRequired,
  score: PropTypes.number.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(mapStateToProps)(Feedback);
