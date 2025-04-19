// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleERC20Token
 * @dev A basic implementation of the ERC20 token standard
 */
contract SimpleERC20Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    // Mapping from address to token balance
    mapping(address => uint256) private balances;
    
    // Mapping from address to mapping of allowances
    mapping(address => mapping(address => uint256)) private allowances;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    /**
     * @dev Constructor that initializes the token with initial supply.
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        
        // Convert initial supply to token units with decimals
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        
        // Assign all initial tokens to the contract creator
        balances[msg.sender] = totalSupply;
        
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    /**
     * @dev Returns the balance of the specified address.
     * @param account The address to check balance for
     * @return The balance of the given address
     */
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
    
    /**
     * @dev Transfers tokens from sender to recipient.
     * @param recipient The address to receive the tokens
     * @param amount The amount of tokens to transfer
     * @return A boolean indicating success
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(recipient != address(0), "Transfer to zero address");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }
    
    /**
     * @dev Returns the allowance the owner has provided to the spender.
     * @param owner The address that owns the tokens
     * @param spender The address that is allowed to spend the tokens
     * @return The remaining allowance
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances[owner][spender];
    }
    
    /**
     * @dev Approves the spender to spend a specified amount of tokens.
     * @param spender The address that will be allowed to spend tokens
     * @param amount The amount of tokens that can be spent
     * @return A boolean indicating success
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        allowances[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfers tokens from one address to another if allowed.
     * @param sender The address to transfer tokens from
     * @param recipient The address to transfer tokens to
     * @param amount The amount of tokens to transfer
     * @return A boolean indicating success
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(sender != address(0), "Transfer from zero address");
        require(recipient != address(0), "Transfer to zero address");
        require(balances[sender] >= amount, "Insufficient balance");
        require(allowances[sender][msg.sender] >= amount, "Insufficient allowance");
        
        balances[sender] -= amount;
        balances[recipient] += amount;
        allowances[sender][msg.sender] -= amount;
        
        emit Transfer(sender, recipient, amount);
        return true;
    }
    
    /**
     * @dev Mint new tokens (only for demo purposes - not in real ERC20)
     * @param amount The amount of tokens to mint
     */
    function mint(uint256 amount) public {
        require(amount > 0, "Amount must be greater than zero");
        
        balances[msg.sender] += amount;
        totalSupply += amount;
        
        emit Transfer(address(0), msg.sender, amount);
    }
}