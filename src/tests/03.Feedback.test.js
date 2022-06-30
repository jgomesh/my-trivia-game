import React from "react";
import { renderWithRouterAndRedux } from './helpers/renderWithRouterAndRedux';
import { cleanup, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import md5 from 'crypto-js/md5';
import App from "../App";
import { successQuestionMock } from './mocks/questions';

describe('Testa a página de feedback', () => {
  beforeEach(cleanup)
  it('01.Testa se o header aparece corretamente', () => {
    const INITIAL_STATE = {
      name: 'João Otávio',
      assertions: 2,
      score: 0,
      gravatarEmail: 'trybe@teste.com',
    }

    const { history } = renderWithRouterAndRedux(<App />, {player: INITIAL_STATE});
    history.push('/feedback');

    expect(history.location.pathname).toBe('/feedback');
    
    const IMG = screen.getByAltText('profile');
    expect(IMG).toBeInTheDocument();

    const hashEmail = md5('trybe@teste.com').toString();
    expect(IMG).toHaveProperty('src', `https://www.gravatar.com/avatar/${hashEmail}` );

    expect(screen.getByText(/joão otávio/i)).toBeInTheDocument();

    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText('2')).toBeInTheDocument();

    const BUTTON_PLAY_AGAIN = screen.getByRole('button', {name: /Play again/i});
    const BUTTON_RANKING = screen.getByRole('button', {name: /ranking/i});
    const MSG_FEEDBACK = screen.getByText(/Could be better.../i)

    expect(BUTTON_PLAY_AGAIN).toBeInTheDocument();
    expect(BUTTON_RANKING).toBeInTheDocument();
    expect(MSG_FEEDBACK).toBeInTheDocument();

  })

  it('02. Testa se a frase -well done- aparece quando acerta + de 3 ', () => {
    const INITIAL_STATE = {
      name: 'João Otávio',
      assertions: 4,
      score: 0,
      gravatarEmail: 'trybe@teste.com',
    }

    const { history } = renderWithRouterAndRedux(<App />, {player: INITIAL_STATE});
    history.push('/feedback');

    const MSG_FEEDBACK = screen.getByText(/well done!/i);

    expect(MSG_FEEDBACK).toBeInTheDocument();
  })

  it('03. Testa se a pagina redireciona para a home', () => {
    const { history } = renderWithRouterAndRedux(<App />);
    history.push('/feedback');

    expect(history.location.pathname).toBe('/feedback');

    const BUTTON_PLAY_AGAIN = screen.getByRole('button', {name: /Play again/i});

    expect(BUTTON_PLAY_AGAIN).toBeInTheDocument();

    userEvent.click(BUTTON_PLAY_AGAIN);

    expect(history.location.pathname).toBe('/');
  })

  it('04. Testa se a pagina redireciona para a ranking', () => {

    const { history } = renderWithRouterAndRedux(<App />);
    history.push('/feedback');

    expect(history.location.pathname).toBe('/feedback');

    const BUTTON_RANKING = screen.getByRole('button', {name: /ranking/i});


    expect(BUTTON_RANKING).toBeInTheDocument();

    const token = 'a9c201e5dce6288034315a596cf296525a305f86b3ba6f5004d90fbb8575be47';
    const fakeUserResponse = {token: token, ranking: [{name: 'João Otávio', score: 320, assertions: 5, gravatarEmail: 'trybe@gmail.com'}]};

    jest.spyOn(Object.getPrototypeOf(localStorage), "setItem");
    jest.spyOn(Object.getPrototypeOf(localStorage), "getItem");

    localStorage.setItem('ranking', JSON.stringify(fakeUserResponse.ranking));
    
    userEvent.click(BUTTON_RANKING);
    
    expect(history.location.pathname).toBe('/ranking');
    expect(localStorage.getItem).toHaveBeenCalled();

  })
})