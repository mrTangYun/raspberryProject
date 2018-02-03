import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { List, Switch } from 'antd-mobile';

import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'

import LircContainer from '../lirc';

class AppContainer extends Component {
	constructor() {
		super();
		this.switchHandler = this.switchHandler.bind(this);
		this.state = {
			status: 'off',
			loading: false
		};
		this.loading = false;
	}

	async switchHandler() {
		if (this.loading) return false;
		this.loading = true;
		const url = this.state.status === 'off' ? 'on' : 'off';
		const json = await fetch('/' + url).then(function(response) {
			return response.json();
		});
		this.loading =false;
		this.setState({
			status: json.status === 1 ? 'on' : 'off'
		});
	}

	async componentDidMount() {
		const json = await fetch('/status').then(function(response) {
			return response.json();
		});
		await this.setState({
			status: json.status === 1 ? 'on' : 'off'
		});
		const LOADING_NODE = document.getElementById('loading');
		LOADING_NODE && LOADING_NODE.parentNode.removeChild(LOADING_NODE);

	}


	render() {
		const {status} = this.state;
		const status_chn = status === 'off' ? '开' : '关';
		return (
			<div className="container">
				<div className="buttons">
					<div className={"btn-switch " + status}  onClick={this.switchHandler}>
						{status_chn}
					</div>
				</div>
			</div>
		);
	}
}


const Home = () => (
	<div>
		<h2>Home</h2>
	</div>
)

const About = () => (
	<div>
		<h2>About</h2>
	</div>
)

const Topic = ({ match }) => (
	<div>
		<h3>{match.params.topicId}</h3>
	</div>
)

const Topics = ({ match }) => (
	<div>
		<h2>Topics</h2>
		<ul>
			<li>
				<Link to={`${match.url}/rendering`}>
					Rendering with React
				</Link>
			</li>
			<li>
				<Link to={`${match.url}/components`}>
					Components
				</Link>
			</li>
			<li>
				<Link to={`${match.url}/props-v-state`}>
					Props v. State
				</Link>
			</li>
		</ul>

		<Route path={`${match.url}/:topicId`} component={Topic}/>
		<Route exact path={match.url} render={() => (
			<h3>Please select a topic.</h3>
		)}/>
	</div>
)

const BasicExample = () => (
	<Router>
		<div>
			<ul>
				<li><Link to="/">Home</Link></li>
				<li><Link to="/lirc">Lirc</Link></li>
			</ul>

			<hr/>

			<Route exact path="/" component={LircContainer}/>
			<Route exact path="/lirc" component={AppContainer}/>
			<Route path="/about" component={About}/>
			<Route path="/topics" component={Topics}/>
		</div>
	</Router>
);
export default BasicExample;