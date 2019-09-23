import React from 'react';


interface AppProps {
}

const App: React.FC<AppProps> = (props: React.PropsWithChildren<AppProps>) => {
    return <div>
        {props.children}
    </div>
};

export default App;
