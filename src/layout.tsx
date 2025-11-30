import type { FC } from 'hono/jsx';

export const Layout: FC = (props) => {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Perfect Finances</title>
				<link rel="stylesheet" href="/assets/picocss@2.0.6.min.css" />
				<link rel="stylesheet" href="/assets/styles.css" />
				<script src="/assets/htmx@2.0.2.min.js" />
				<meta
					name="htmx-config"
					content='{"responseHandling": [{"code":"...", "swap": true}]}'
				/>
			</head>
			<body>
				<main class="container">
					<nav>
						<ul>
							<li>
								<a href="/">Home</a>
							</li>
							<li>
								<a href="/manage">Manage</a>
							</li>
							<li>
								<a href="/report">Last Month</a>
							</li>
						</ul>
						<ul>
							<li>
								<form hx-post="/logout" hx-target="body">
									<button type="submit" class="outline">
										Logout
									</button>
								</form>
							</li>
						</ul>
					</nav>
					{props.children}
				</main>
			</body>
		</html>
	);
};
