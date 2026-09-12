import { nodeText } from './sourceRuntime';
export function linkBinding(node, props) {
  if (node.localName !== 'a') return;
  const text = nodeText(node).toLowerCase();
  if (/privacidade/.test(text)) props.href = '/privacy';
  else if (/termos/.test(text)) props.href = '/terms';
  else if (/esqueceu/.test(text)) props.href = '/forgot-password';
  else if (/cadastre|criar conta/.test(text)) props.href = '/register';
  else if (/entrar|login|área do cliente|voltar ao acesso/.test(text)) props.href = '/login';
}


