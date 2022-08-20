<?php
declare(strict_types=1);

/**
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * Copyright (c) 2014 Cees-Jan Kiewiet
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link          https://cakephp.org CakePHP(tm) Project
 * @since         1.0.0
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */

namespace Cake\TwigView\Twig\TokenParser;

use Cake\TwigView\Twig\Node\Element as ElementNode;
use Twig\Node\Node;
use Twig\Token;
use Twig\TokenParser\IncludeTokenParser;

/**
 * Class ElementParser.
 *
 * @deprecated 1.0.0 Elements are now rendered using `element()` function instead, provided by `ViewExtension`.
 */
class ElementParser extends IncludeTokenParser
{
    /**
     * Parse token.
     *
     * @param \Twig\Token $token Token.
     * @return \Twig\Node\Node
     */
    public function parse(Token $token): Node
    {
        static $warned = false;
        if (!$warned) {
            $warned = true;
            deprecationWarning('`element` tag is deprecated. Use `element()` function instead.');
        }

        $stream = $this->parser->getStream();
        $name = $this->parser->getExpressionParser()->parseExpression();

        $data = null;
        if (!$stream->test(Token::BLOCK_END_TYPE)) {
            $data = $this->parser->getExpressionParser()->parseExpression();
        }

        $options = null;
        if (!$stream->test(Token::BLOCK_END_TYPE)) {
            $options = $this->parser->getExpressionParser()->parseExpression();
        }

        $stream->expect(Token::BLOCK_END_TYPE);

        return new ElementNode($name, $data, $options, $token->getLine(), $this->getTag());
    }

    /**
     * Get tag name.
     *
     * @return string
     */
    public function getTag(): string
    {
        return 'element';
    }
}
