import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { PostRoute } from './routes/posts.route';
import { CommentRoute } from './routes/comments.route';

ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute(), new PostRoute(), new CommentRoute()]);

app.listen();
