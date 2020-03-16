import React from 'react';
import { Switch, BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import DefaultPlayer from './Player/default';
import VideoReactPlayer from './Player/videoReact';
import ReactPlayerPlayer from './Player/reactPlayer';
import Footer from './Footer';
import styles from './app.module.scss';

class App extends React.Component {
	render() {
		return (
			<Router>
				<div className={styles.app}>
					<div className={styles.inlineDiv}>
						<div className={styles.content}>
							<Switch>
								<Route exact path="/default">
									<DefaultPlayer />
								</Route>
								<Route exact path="/video-react">
									<VideoReactPlayer />
								</Route>
								<Route exact path="/react-player">
									<ReactPlayerPlayer />
								</Route>
								<Redirect to="/default" />
							</Switch>
						</div>
						<div className={styles.footer}>
							<Footer />
						</div>
					</div>
				</div>
			</Router>
		)
	}
}

export default App;
