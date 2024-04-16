import { appContainer } from '../../../Application';
import FourGuardiansConfig from './FourGuardiansConfig';

export default class FourGuardiansModule {
    constructor() {
        appContainer.bind<FourGuardiansConfig>(FourGuardiansConfig).toSelf().inSingletonScope();
    }
}

new FourGuardiansModule();
